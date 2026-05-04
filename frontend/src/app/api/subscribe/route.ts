import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { email, editalId, alertDays } = await request.json();

    if (!email || !editalId) {
      return NextResponse.json(
        { error: 'Email e editalId são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Upsert subscription
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        email,
        edital_id: editalId,
        alert_days: alertDays || [7, 3, 1],
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar subscription:', error);
      return NextResponse.json(
        { error: 'Erro ao criar inscrição' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { email, editalId } = await request.json();

    if (!email || !editalId) {
      return NextResponse.json(
        { error: 'Email e editalId são obrigatórios' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('email', email)
      .eq('edital_id', editalId);

    if (error) {
      console.error('Erro ao deletar subscription:', error);
      return NextResponse.json(
        { error: 'Erro ao remover inscrição' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
